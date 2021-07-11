import React, { useState } from 'react';
import deactivateAccount from './deactivateAccount';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export default function Deactivate(){
    const[oldPwd,setOldPassword] = useState("");
    async function deactivate(e){
      e.preventDefault();
      const passwordData = Object.freeze({
        password: oldPwd
    });

    const res = await deactivateAccount(passwordData);
    if(res.status===200){
      window.alert('Account was succesfully deactivated');
    }
    else{
      const error = new Error(res.error);
      throw error;
    }
}   
    return(
      <div id = "changePwd">
      <Form.Group controlID="oldPassword">
            <Form.Label htmlFor="oldPassword">Old Password</Form.Label>
            <Form.Control
              type="password"
              value={oldPwd}
              name="password"
              id="password"
              placeholder="Old password"
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </Form.Group>
          <Button
            onClick={deactivate}
            type="button"
            id="deactivate"
            variant="outline-primary"
          >
            Deactivate Account
          </Button>
        </div>
    );    
    
}
