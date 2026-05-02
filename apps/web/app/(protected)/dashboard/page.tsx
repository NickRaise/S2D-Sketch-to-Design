import api from "@/lib/axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
const page = async () => {
  const session = await getServerSession(authOptions);

  try {
    console.log("session in server component:", session);
    const response = await api.get("/me");
  } catch (error) {
    console.error("Error fetching protected data:", error);
  }
  return <div>page</div>;
};

export default page;
