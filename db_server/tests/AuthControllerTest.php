<?php
// filepath: tests/AuthControllerTest.php

require_once 'BaseApiTest.php';

class AuthControllerTest extends BaseApiTest
{
    // Override setUp to not get token automatically for auth tests
    protected function setUp(): void
    {
        // Don't call parent::setUp() as we test auth without tokens
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
