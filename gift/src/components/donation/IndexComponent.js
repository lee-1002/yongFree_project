import React from "react";
import { Outlet } from "react-router-dom";

const IndexComponent = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

export default IndexComponent;
