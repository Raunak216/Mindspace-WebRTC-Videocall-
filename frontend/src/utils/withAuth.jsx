import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const withAuth = (WrappedComponent) => {
  return function AuthComponent(props) {
    const navigate = useNavigate();

    useEffect(() => {
      if (!localStorage.getItem("token")) {
        navigate("/auth");
      }
    }, [navigate]);

    return <WrappedComponent {...props} />;
  };
};
export default withAuth;
