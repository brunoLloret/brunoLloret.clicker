import { useState, useEffect } from "react";
import { getTotalClicks, postClick } from "../API service/clickService.ts";
import "./App.css";

function App() {
  const [totalClicks, setTotalClicks] = useState(0);
  const [clickData, setClickData] = useState({});

  useEffect(() => {
    const fetchClicks = async () => {
      try {
        const data = await getTotalClicks();
        console.log("total clicks", data.totalClicks);
        setTotalClicks(data.totalClicks);
      } catch (error) {
        console.error("Error fetching total clicks:", error);
      }
    };

    fetchClicks();
  }, []);

  const handleClick = async () => {
    try {
      const data = await postClick(clickData);
      setTotalClicks(data.newTotal);
      console.log("data new total", data.newTotal);
    } catch (error) {
      console.error("Error posting click:", error);
    }
  };

  return (
    <>
      <div>
        <h1>The count is: {totalClicks}</h1>
        <div className="card">
          <button onClick={handleClick}> Click me!</button>
        </div>
      </div>
    </>
  );
}

export default App;
