import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import { Button, IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { AuthContext } from "../context/AuthContext";
import styles from "../styles/homeStyle.module.css";

function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const { addToUserHistory } = useContext(AuthContext);

  let handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  return (
    <div className={styles.homeMainContainer}>
      {/* Navbar */}
      <div className={styles.navbar}>
        <div className={styles.logo}>
          <h2>MindSpace</h2>
        </div>

        <div className={styles.navLinks}>
          <IconButton
            onClick={() => navigate("/history")}
            className={styles.iconBtn}
          >
            <p>History</p>
            <RestoreIcon />
          </IconButton>

          <Button
            className={styles.logoutBtn}
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Centered Content */}
      <div className={styles.meetContainer}>
        <div className={styles.homeHeading}>
          <h2>Welcome back</h2>
          <p>
            Every session brings you closer to your goals. Stay focused, study
            smart.
          </p>
        </div>

        <div className={styles.actionSection}>
          <p className={styles.label}>Enter a Meeting ID to join</p>

          <div className={styles.inputGroup}>
            <TextField
              onChange={(e) => setMeetingCode(e.target.value)}
              id="outlined-basic"
              label="Meeting Code"
              variant="outlined"
              size="small"
              fullWidth
            />
            <Button
              onClick={handleJoinVideoCall}
              variant="contained"
              className={styles.joinBtn}
            >
              Join
            </Button>
          </div>

          <p className={styles.helperText}>
            Need a new room? Create one instantly.
          </p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(HomeComponent);
