import { orange } from "@mui/material/colors";
import React from "react";
import { Link } from "react-router-dom";
function LandingPage() {
  return (
    <div className="landingPageContainer">
      <div className="navbar">
        <div className="navHeader">
          <h2 style={{ color: "orange" }}>MindSpace</h2>
        </div>
        <div className="navList">
          {/* <p>Join as guest</p> */}
          <Link className="buttonlink" to={"/auth"}>
            <p>Register</p>
          </Link>
          <Link className="buttonlink" to={"/auth"}>
            <p>Login</p>
          </Link>
        </div>
      </div>
      <div className="landingMainContainer">
        <div className="landingText">
          <p className="landingTitle">Study together, stay focused </p>
          <p className="landing_title_text2">
            MindSpace makes group study simple with video, notes, and focus
            tools <br /> all in one place
          </p>
        </div>
        <div className="landingImage">
          <img src="/HomeImage1.png" alt="landingImage" />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
