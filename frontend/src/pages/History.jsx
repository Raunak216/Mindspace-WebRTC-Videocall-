import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import styles from "../styles/historyStyle.module.css";
import { Link } from "react-router-dom";

export default function History() {
  const { getUserHistory } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getUserHistory();
        setMeetings(history);
      } catch {}
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={styles.historyMainContainer}>
      <nav className={styles.navbar}>
        <Link to="/home" className={styles.logo}>
          Mind<span className={styles.logoAccent}>Space</span>.
        </Link>
        <Link to="/home" className={styles.homeBtn}>
          <HomeIcon style={{ fontSize: "1rem" }} />
          Home
        </Link>
      </nav>

      <div className={styles.content}>
        <h1 className={styles.pageTitle}>Session History</h1>
        <p className={styles.pageSubtitle}>Your past study rooms</p>

        {meetings.length > 0 ? (
          <div className={styles.meetingList}>
            {meetings.map((e, i) => (
              <div className={styles.meetingCard} key={i}>
                <div>
                  <p className={styles.meetingCode}>{e.meetingCode}</p>
                  <p className={styles.meetingDate}>{formatDate(e.date)}</p>
                </div>
                <button
                  className={styles.rejoinBtn}
                  onClick={() => navigate(`/${e.meetingCode}`)}
                >
                  Rejoin
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>
            <h3>No sessions yet</h3>
            <p>Your past study rooms will show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
