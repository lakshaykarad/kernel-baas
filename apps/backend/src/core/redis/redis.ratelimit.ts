import {redis} from './redis.client.ts';

export interface RateLimitResult{
  allowed : boolean;
  remaining : number;
  retryAfterSec: number;
}
/*
  LUA -> lightweight programming language used to write small scripts that run directly inside the Redis database.

  Why Lua -> two separate Node calls, and Node crashed between them,
             Putting both inside one Lua script means Redis executes them as one indivisible operation.
*/ 

const FIXED_WINDOW_LUA = `
  local current = redis.call("INCR", KEYS[1])
  local ttl = redis.call("TTL", KEYS[1]) 
  if ttl == -1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
    ttl = tonumber(ARGV[1])
  end
  return {current, ttl}
`;

const SLIDING_WINDOW_LUA = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local windowMs = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])
  local member = ARGV[4]

  redis.call("ZREMRANGEBYSCORE", key, 0, now - windowMs)
  local count = redis.call("ZCARD", key)

  if count >= limit then
    local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")
    local retryAfterMs = windowMs - (now - tonumber(oldest[2]))
    return {0, count, math.max(1, math.ceil(retryAfterMs / 1000))}
  end

  redis.call("ZADD", key, now, member)
  redis.call("PEXPIRE", key, windowMs)
  return {1, count + 1, 0}
`;

function validInputs(limit: number, windowSeconds : number ) : void {
  if(!Number.isInteger(limit) || limit < 1){
    throw new Error("limit must be an integer >= 1");
  }
  if(!Number.isInteger(windowSeconds) || windowSeconds < 1){
    throw new Error('windowSeconds must be an integer >= 1')
  }
}
// used for daily project quotas (500 emails/day) 
export async function checkFixedWindowLimit(
  key : string,
  limit: number,
  windowSeconds : number
) : Promise<RateLimitResult> {

  validInputs(limit, windowSeconds);
  // redis.eval (evaluate) -> 
  const[count,ttl] = (await redis.eval(
    FIXED_WINDOW_LUA,
    1,
    key,
    windowSeconds
  )) as [number, number];
  
  const allowed = count <= limit;
  
  return {
    allowed,
    remaining: Math.max(0, limit-count),
    retryAfterSec: allowed ? 0 : Math.max(1,ttl),
  };
 
}
// used for OTP cooldowns (3 per 10 min per user) -> Avoid going bankrupt
export async function checkSlidingWindowLimit(
  key : string,
  limit : number,
  windowSeconds : number
) : Promise<RateLimitResult>  {

  validInputs(limit,windowSeconds);

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const uniqueMember = `${now} - ${Math.random().toString(35).slice(2,8)}`;
  
  const [allowedFlag, count, retryAfterSec] = (await redis.eval(
    SLIDING_WINDOW_LUA,
    1,
    key,
    now,
    windowMs,
    limit,
    uniqueMember
  )) as [number,number,number]
  
  return {
    allowed : allowedFlag === 1,
    remaining : Math.max(0, limit - count),
    retryAfterSec,
  };
}