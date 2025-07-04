<?php

require_once 'BaseApiTest.php';

class AuditControllerTest extends BaseApiTest
{
    public function testAuditListWithoutAuth()
    {
        // Test without authorization header
        [$status, $json] = $this->get('/audit');
        $this->assertEquals(401, $status);
        $this->assertEquals(['error' => 'Unauthorized'], $json);
    }

    public function testAuditListWithUserAuth()
    {
        // Test with regular user authorization (should get 403)
        [$status, $json] = $this->get('/audit', $this->withUserAuth());
        
        $this->assertEquals(403, $status);
        $this->assertArrayHasKey('error', $json);
    }

    public function testAuditListWithAdminAuth()
    {
        // Test with admin authorization (should get 200)
        [$status, $json] = $this->get('/audit', $this->withAdminAuth());
        
        $this->assertEquals(200, $status);
        $this->assertArrayHasKey('logs', $json);
        $this->assertArrayHasKey('total', $json);
        $this->assertArrayHasKey('limit', $json);
        $this->assertArrayHasKey('offset', $json);
        $this->assertIsArray($json['logs']);
        $this->assertIsInt($json['total']);
    }

    public function testAuditListWithTableFilterUserAuth()
    {
        // Test table filter with regular user (should get 403)
        [$status, $json] = $this->get('/audit?table=users&limit=10', $this->withUserAuth());
        
        $this->assertEquals(403, $status);
        $this->assertArrayHasKey('error', $json);
    }

    public function testAuditListWithTableFilterAdminAuth()
    {
        // Test table filter with admin user (should get 200)
        [$status, $json] = $this->get('/audit?table=users&limit=10', $this->withAdminAuth());
        
        $this->assertEquals(200, $status);
        $this->assertArrayHasKey('logs', $json);
        $this->assertArrayHasKey('total', $json);
        $this->assertIsArray($json['logs']);
    }

    public function testAuditRecordWithoutAuth()
    {
        // Test without authorization header
        [$status, $json] = $this->get('/audit/record?table=users&record_id=1');
        $this->assertEquals(401, $status);
        $this->assertEquals(['error' => 'Unauthorized'], $json);
    }

    public function testAuditRecordMissingParamsUserAuth()
    {
        // Test missing params with regular user (should get 403)
        [$status, $json] = $this->get('/audit/record', $this->withUserAuth());
        
        $this->assertEquals(403, $status);
        $this->assertArrayHasKey('error', $json);
    }

    public function testAuditRecordMissingParamsAdminAuth()
    {
        // Test missing params with admin user (should get 400)
        [$status, $json] = $this->get('/audit/record', $this->withAdminAuth());
        
        $this->assertEquals(400, $status);
        $this->assertEquals(['error' => 'table and record_id are required'], $json);
    }

    public function testAuditRecordWithValidParamsUserAuth()
    {
        // Test valid params with regular user (should get 403)
        [$status, $json] = $this->get('/audit/record?table=users&record_id=1', $this->withUserAuth());
        
        $this->assertEquals(403, $status);
        $this->assertArrayHasKey('error', $json);
    }

    public function testAuditRecordWithValidParamsAdminAuth()
    {
        // Test valid params with admin user (should get 200)
        [$status, $json] = $this->get('/audit/record?table=users&record_id=1', $this->withAdminAuth());
        
        $this->assertEquals(200, $status);
        $this->assertIsArray($json);
    }
}
