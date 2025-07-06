<?php
// filepath: tests/BaseApiTest.php

use PHPUnit\Framework\TestCase;

abstract class BaseApiTest extends TestCase
{
    protected $baseUrl = 'http://localhost:5000';
    protected $userToken;
    protected $adminToken;
    protected $managerToken;

    protected function setUp(): void
    {
        // Login to get tokens for authenticated requests
        $this->userToken = $this->getTokenForUser('test@test.test', '12345');
        $this->adminToken = $this->getTokenForUser('admin@admin.admin', 'admin');
        $this->managerToken = $this->getTokenForUser('manager@manager.manager', 'manager');
    }

    /**
     * Get token for specific user credentials
     */
    protected function getTokenForUser(string $email, string $password): string
    {
        $ch = curl_init($this->baseUrl . '/auth/login');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'email' => $email,
            'password' => $password
        ]));
        curl_setopt($ch, CURLOPT_HEADER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $body = substr($response, $header_size);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("Login failed with HTTP $httpCode for $email");
        }
        
        $data = json_decode($body, true);
        if (!isset($data['token'])) {
            throw new Exception("No token returned from login for $email");
        }
        
        return $data['token'];
    }

    /**
     * Get token and user ID for specific user credentials
     */
    protected function getTokenAndIdForUser(string $email, string $password): array
    {
        $ch = curl_init($this->baseUrl . '/auth/login');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'email' => $email,
            'password' => $password
        ]));
        curl_setopt($ch, CURLOPT_HEADER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $body = substr($response, $header_size);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("Login failed with HTTP $httpCode for $email");
        }
        
        $data = json_decode($body, true);
        if (!isset($data['token'])) {
            throw new Exception("No token returned from login for $email");
        }
        
        // Decode JWT to get user ID
        $token = $data['token'];
        $payload = json_decode(base64_decode(str_replace('_', '/', str_replace('-', '+', explode('.', $token)[1]))), true);
        
        return [
            'token' => $token,
            'id' => $payload['sub']
        ];
    }

    /**
     * Make a GET request
     */
    protected function get($endpoint, $headers = [])
    {
        $ch = curl_init($this->baseUrl . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_HEADER, true);
        
        $response = curl_exec($ch);
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $header = substr($response, 0, $header_size);
        $body = substr($response, $header_size);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return [$status, json_decode($body, true)];
    }

    /**
     * Make a POST request
     */
    protected function post($endpoint, $data, $headers = [])
    {
        $defaultHeaders = ['Content-Type: application/json'];
        $headers = array_merge($defaultHeaders, $headers);
        
        $ch = curl_init($this->baseUrl . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HEADER, true);
        
        $response = curl_exec($ch);
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $header = substr($response, 0, $header_size);
        $body = substr($response, $header_size);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return [$status, json_decode($body, true)];
    }

    /**
     * Make a PUT request
     */
    protected function put($endpoint, $data, $headers = [])
    {
        $defaultHeaders = ['Content-Type: application/json'];
        $headers = array_merge($defaultHeaders, $headers);
        
        $ch = curl_init($this->baseUrl . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HEADER, true);
        
        $response = curl_exec($ch);
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $header = substr($response, 0, $header_size);
        $body = substr($response, $header_size);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return [$status, json_decode($body, true)];
    }

    /**
     * Make a DELETE request
     */
    protected function delete($endpoint, $data = null, $headers = [])
    {
        $defaultHeaders = ['Content-Type: application/json'];
        $headers = array_merge($defaultHeaders, $headers);
        
        $ch = curl_init($this->baseUrl . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        // If data is provided, include it in the request body
        if ($data !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        curl_setopt($ch, CURLOPT_HEADER, true);
        
        $response = curl_exec($ch);
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $header = substr($response, 0, $header_size);
        $body = substr($response, $header_size);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return [$status, json_decode($body, true)];
    }

    /**
     * Make a PATCH request
     */
    protected function patch($endpoint, $data, $headers = [])
    {
        $defaultHeaders = ['Content-Type: application/json'];
        $headers = array_merge($defaultHeaders, $headers);
        
        $ch = curl_init($this->baseUrl . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HEADER, true);
        
        $response = curl_exec($ch);
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $header = substr($response, 0, $header_size);
        $body = substr($response, $header_size);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return [$status, json_decode($body, true)];
    }

    /**
     * Get authorization headers with token
     */
    protected function withUserAuth($additionalHeaders = [])
    {
        $authHeaders = ['Authorization: Bearer ' . $this->userToken];
        return array_merge($authHeaders, $additionalHeaders);
    }

    /**
     * Get authorization headers with admin token
     */
    protected function withAdminAuth($additionalHeaders = [])
    {
        if (empty($this->adminToken)) {
            $this->markTestSkipped('Admin token not available');
        }
        $authHeaders = ['Authorization: Bearer ' . $this->adminToken];
        return array_merge($authHeaders, $additionalHeaders);
    }

    /**
     * Get authorization headers with manager token
     */
    protected function withManagerAuth($additionalHeaders = [])
    {
        if (empty($this->managerToken)) {
            $this->markTestSkipped('Manager token not available');
        }
        $authHeaders = ['Authorization: Bearer ' . $this->managerToken];
        return array_merge($authHeaders, $additionalHeaders);
    }

    /**
     * Get user ID by email address
     * @param string $email The email address to search for
     * @param bool $throwIfNotFound If true, throws exception when user not found; if false, returns null
     */
    protected function getUserIdByEmail(string $email, bool $throwIfNotFound = false): ?int
    {
        [$status, $response] = $this->get('/users', $this->withAdminAuth());
        
        if ($status !== 200 || !is_array($response)) {
            if ($throwIfNotFound) {
                throw new Exception("Failed to fetch users list");
            }
            return null;
        }

        foreach ($response as $user) {
            if ($user['email'] === $email) {
                return (int)$user['id'];
            }
        }

        if ($throwIfNotFound) {
            throw new Exception("User with email $email not found");
        }
        
        return null;
    }

    /**
     * Get authorization headers with custom token
     */
    protected function withToken($token, $additionalHeaders = [])
    {
        $authHeaders = ['Authorization: Bearer ' . $token];
        return array_merge($authHeaders, $additionalHeaders);
    }
}
