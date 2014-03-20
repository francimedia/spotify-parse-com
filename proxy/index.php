<?php

require_once(dirname(__FILE__) . '/firebase-php/firebaseLib.php');


class submitVote
{
    
    private $firebase;
    
    private $device_id;
    
    private $current_round_id;
    
    public function __construct()
    {
        $config_file = dirname(__FILE__) . '/config.php';
        if (file_exists($config_file)) {
            include($config_file);
        }
        $this->firebase = new Firebase(firebase_url, firebase_auth_token);
    }
    
    public function run()
    {
        
        if ($this->alreadyVoted()) {
            $this->response("Already voted", false);
        }
        
        $this->addVote();
        $this->response("Vote saved", true);
        
    }
    
    private function response($message, $success)
    {
        echo json_encode(array(
            'message' => $message,
            'success' => $success
        ));
        exit;
    }
    
    private function getCurrentRoundId()
    {
        
        if ($this->current_round_id) {
            return $this->current_round_id;
        }
        
        $rounds = json_decode($this->firebase->get('rounds'));
        
        $round_ids = array();
        
        foreach ($rounds as $key => $round) {
            $round_ids[] = $round->id;
        }
        
        $this->current_round_id = max($round_ids);
        
        return $this->current_round_id;
        
    }
    
    private function getDeviceId()
    {
        
        if ($this->device_id) {
            return $this->device_id;
        }
        
        $this->device_id = isset($_GET['device_id']) ? $_GET['device_id'] : 'no_device_id';
        
        return $this->device_id;
        
    }
    
    private function alreadyVoted()
    {
        
        $votes = (array) json_decode($this->firebase->get('votes/' . $this->getCurrentRoundId()));

        if (!$votes || count($votes) == 0) {
            return false;
        }

        foreach ($votes as $key => $vote) {
            if ($vote->device_id == $this->getDeviceId()) {
                return true;
            }
        }
        
        return false;
        
    }
    
    private function addVote()
    {
        
        $this->firebase->push('votes/' . $this->getCurrentRoundId(), array(
            'device_id' => $this->getDeviceId(),
            'createdAt' => time()
        ));
        
    }
    
}

$submitVote = new submitVote();
$submitVote->run();