import React, { useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ListComponent from "../../components/donation/ListComponent";

const IndexPage = () => {
  const navigate = useNavigate();

  const handleClickAdd = useCallback(() => {
    navigate({ pathname: "add" });
  });

  return (
    <>
      <div className="w-full flex m-2 p-2 ">
        <div
          className="text-xl m-1 p-2 w-20 font-extrabold  text-center underline"
          onClick={handleClickAdd}
        >
          ADD
        </div>
      </div>
      <div className="flex flex-wrap w-full">
        <Outlet />
      </div>
      <ListComponent />
    </>
  );
};

export default IndexPage;
