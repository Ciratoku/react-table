// components
import Table from "./components/Table";

import { useState } from "react";

export default function App() {
  const [tab, setTab] = useState("main");
  return (
    <>
      <main>
        <Table></Table>
      </main>
    </>
  );
}
