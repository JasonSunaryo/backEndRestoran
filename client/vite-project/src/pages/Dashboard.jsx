import React from "react";
import { Avatar, Card, Flex, Typography, Form, Input, Button, Alert, Spin } from "antd";
import { useAuth } from "../contexts/AuthContext.jsx";
import { UserOutlined } from "@ant-design/icons";

const Dashboard = () => {
    const handleContinue = () => {
        navigate("/main.ejs");
      };

  const { userData, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Card className="profile-card">
      <Flex vertical gap='small' align='center'>Welcome</Flex>
      <Avatar size={150} icon={<UserOutlined />} className="avatar" />
      <Typography.Title level={2} strong className="username">
        {userData.name}
      </Typography.Title>
      <Typography.Text type="secondary" strong>
        Email : {userData.email}
      </Typography.Text>
      <Typography.Text type="secondary"className="role">
        Role : {userData.role}
      </Typography.Text>
      <Button
        size="large"
        type="primary"
        className="profile-btn"
        onClick={handleLogout}
      >
        Logout
      </Button>
      <Button
     size="large"
     type="primary"
     className="profile-btn"
     onClick={handleContinue}
   >
     Continue
   </Button>
    </Card>
  );
};

export default Dashboard;
