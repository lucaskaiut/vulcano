<?php

describe('test environment', function () {
    it('uses sqlite in memory instead of the development mysql database', function () {
        expect(config('database.default'))->toBe('sqlite')
            ->and(config('database.connections.sqlite.database'))->toBe(':memory:');
    });
});
