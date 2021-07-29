<?php

    // check whether the input JSON is valid
    function check_json($json_string) {
        json_decode($json_string);
        return json_last_error() == JSON_ERROR_NONE;
    }

?>