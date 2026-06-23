<?php

namespace <%= vendorNamespace %>\<%= className %>\Http\Controllers;

class Show<%= className %>Controller extends Controller
{
    public function __invoke()
    {
        return 'Hello from <%= className %> Controller';
    }
}
