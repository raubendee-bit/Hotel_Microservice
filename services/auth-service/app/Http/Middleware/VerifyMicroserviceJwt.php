<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;

class VerifyMicroserviceJwt
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Authorization header missing'], 401);
        }

        try {
            $jwtSecret = env('JWT_SECRET', 'fisherel_jwt_secret_key_extremely_secure_key_12345');
            // Decode the stateless token
            $decoded = JWT::decode($token, new Key($jwtSecret, 'HS256'));
            
            // Attach validated claims to the request attributes
            $request->attributes->add([
                'user_id' => $decoded->sub,
                'user_role' => $decoded->role,
                'user_email' => $decoded->email
            ]);
            
            return $next($request);
        } catch (Exception $e) {
            return response()->json(['error' => 'Invalid or expired token', 'message' => $e->getMessage()], 401);
        }
    }
}
