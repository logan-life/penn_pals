import React, { useState } from 'react';
import changePasswordFunct from './changePasswordFunction';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";


export default function ChangePassword(){
    const[newPwd, setPassword] = useState("");
    const[newPwdCopy,setCopy] = useState("");
    const[oldPwd,setOldPassword] = useState("");
    async function changePassword(e){
      e.preventDefault();
      if(newPwd!==newPwdCopy){
          window.alert('Password and password copy are different');
      }
      else{
      const passwordData = Object.freeze({
        password: oldPwd,
        newPassword:newPwd
    });
    const res = await changePasswordFunct(passwordData);
    if (res.status===200){
      window.alert('Password was successfully changed');
    }
    else{
      const error = new Error(res.error);
      throw error;
    }
 
    }
}
    return(
      <div id = "changePwd">
      <div className="Profile Person">
      <Form.Group controlID="oldPassword">
            <Form.Label htmlFor="oldPassword">Old Password</Form.Label>
            <Form.Control
              type="password"
              value={oldPwd}
              name="password"
              id="oldPassword"
              placeholder="Old password"
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlID="newPassword">
            <Form.Label htmlFor="newPassword">New Password</Form.Label>
            <Form.Control
              type="password"
              value={newPwd}
              name="newPassword"
              id="newPassword"
              placeholder="New password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
            <Form.Group controlID="newPasswordCopy">
            <Form.Label htmlFor="newPasswordCopy">Repeat new password</Form.Label>
            <Form.Control
              type="password"
              value={newPwdCopy}
              name="newPasswordCopy"
              id="newPasswordCopy"
              placeholder="Repeat new password" 
              onChange={(e) => setCopy(e.target.value)}
            />
          </Form.Group>
        <Button
            onClick={changePassword}
            type="button"
            id="changePswd"
            variant="outline-primary"
          >
            Change Password
          </Button>
        </div>
        </div>
    );    
    
}

