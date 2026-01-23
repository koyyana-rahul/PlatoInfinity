import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import { useSocket } from "../../../socket/SocketProvider";
import Axios from "../../../api/axios";
import tableApi from "../../../api/table.api";
import sessionApi from "../../../api/session.api";

import TableCard from "../../../components/waiter/TableCard";
import SessionInfoModal from "../../../components/waiter/SessionInfoModal";

export default function WaiterDashboard() {
  const restaurantId = useSelector((s) => s.user.restaurantId);

  const [tables, setTables] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [pinInfo, setPinInfo] = useState(null);

  const load = async () => {
    const [t, s] = await Promise.all([
      Axios(tableApi.list(restaurantId)),
      Axios(sessionApi.list(restaurantId, { status: "OPEN" })),
    ]);
    setTables(t.data.data || []);
    setSessions(s.data.data || []);
  };

    const socket = useSocket();

  

    useEffect(() => {

      load();

    }, [restaurantId]);

  

    useEffect(() => {

      if (!socket) return;

  

      const handleSessionOpened = (newSession) => {

        setSessions((prev) => [...prev, newSession]);

        setTables((prev) =>

          prev.map((t) =>

            t._id === newSession.tableId._id ? { ...t, status: "OCCUPIED" } : t

          )

        );

      };

  

      const handleSessionClosed = ({ sessionId, tableId }) => {

        setSessions((prev) => prev.filter((s) => s._id !== sessionId));

        setTables((prev) =>

          prev.map((t) => (t._id === tableId ? { ...t, status: "FREE" } : t))

        );

      };

  

      socket.on("session:opened", handleSessionOpened);

      socket.on("session:closed", handleSessionClosed);

  

      return () => {

        socket.off("session:opened", handleSessionOpened);

        socket.off("session:closed", handleSessionClosed);

      };

    }, [socket]);

  

    const sessionByTable = useMemo(() => {

      const map = new Map();

      sessions.forEach((s) => map.set(String(s.tableId._id), s));

      return map;

    }, [sessions]);

  

    const openSession = async (tableId) => {

      const res = await Axios({

        ...sessionApi.open(restaurantId),

        data: { tableId },

      });

      setPinInfo(res.data.data);

      toast.success("Session opened");

      // load() is no longer needed here

    };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tables</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => {
          const session = sessionByTable.get(String(table._id));
          return (
            <TableCard
              key={table._id}
              table={table}
              activeSession={session}
              onOpen={() => openSession(table._id)}
              onViewPin={() =>
                setPinInfo({
                  tablePin: session.tablePin,
                })
              }
            />
          );
        })}
      </div>

      <SessionInfoModal info={pinInfo} onClose={() => setPinInfo(null)} />
    </div>
  );
}
