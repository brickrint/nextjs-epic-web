import { redirect } from "next/navigation";
import React from "react";

export default async function Page({}) {
  redirect("/api/logout");

  return <div>Page</div>;
}
