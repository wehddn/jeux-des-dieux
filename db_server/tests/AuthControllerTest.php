<?php
// filepath: tests/AuthControllerTest.php

use PHPUnit\Framework\TestCase;

class AuthControllerTest extends TestCase
{
    private $baseUrl = 'http://localhost:5000';

    private function post($endpoint, $data)
    {
        $ch = curl_init($this->baseUrl . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
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

    public function testRegisterMissingFields()
    {
        [$status, $json] = $this->post('/auth/register', []);
        $this->assertEquals(400, $status);
        $this->assertEquals(['error' => 'Invalid payload'], $json);
    }

    public function testRegisterEmailExists()
    {
        [$status, $json] = $this->post('/auth/register', [
            'email' => 'test@test.test',
            'password' => '12345'
        ]);
        $this->assertEquals(409, $status);
        $this->assertEquals(['error' => 'Email exists'], $json);
    }

    public function testLoginMissingFields()
    {
        [$status, $json] = $this->post('/auth/login', []);
        $this->assertEquals(400, $status);
        $this->assertEquals(['error' => 'Invalid payload'], $json);
    }

    public function testLoginInexistentUser()
    {
        [$status, $json] = $this->post('/auth/login', [
            'email' => 'wrongemail',
            'password' => 'wrongpass'
        ]);
        $this->assertEquals(401, $status);
        $this->assertEquals(['error' => 'Invalid credentials'], $json);
    }

    public function testLoginWrongPassword()
    {
        [$status, $json] = $this->post('/auth/login', [
            'email' => 'test@test.test',
            'password' => 'wrongpass'
        ]);
        $this->assertEquals(401, $status);
        $this->assertEquals(['error' => 'Invalid credentials'], $json);
    }

    public function testLoginSuccess()
    {
        [$status, $json] = $this->post('/auth/login', [
            'email' => 'test@test.test',
            'password' => '12345'
        ]);
        $this->assertEquals(200, $status);
        $this->assertArrayHasKey('token', $json);
        $this->assertIsString($json['token']);
    }
}
