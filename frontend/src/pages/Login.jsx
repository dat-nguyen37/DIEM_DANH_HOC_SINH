import React, { useState } from "react";
import {
  EuiButton,
  EuiFieldPassword,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiPageTemplate,
  EuiPanel,
  EuiTitle,
  EuiSpacer,
} from "@elastic/eui";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API}/user/login`, {
        username,
        password,
      });
      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
        navigate("/");
      }
    } catch (error) {
      alert("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <EuiPageTemplate>
      <EuiPageTemplate.Section grow={false}>
        <div style={{ maxWidth: 400, margin: "100px auto" }}>
          <EuiPanel paddingSize="l" hasShadow>
            <EuiTitle size="m">
              <h1>Đăng nhập</h1>
            </EuiTitle>
            <EuiSpacer />
            <EuiForm component="form" onSubmit={handleLogin}>
              <EuiFormRow label="Tên đăng nhập">
                <EuiFieldText
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </EuiFormRow>
              <EuiFormRow label="Mật khẩu">
                <EuiFieldPassword
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </EuiFormRow>
              <EuiSpacer />
              <EuiButton type="submit" fill fullWidth>
                Đăng nhập
              </EuiButton>
            </EuiForm>
          </EuiPanel>
        </div>
      </EuiPageTemplate.Section>
    </EuiPageTemplate>
  );
}
