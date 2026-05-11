import { cookies } from "next/headers";
import api from "@/lib/axios";
import { ApiResponse, IAuthData } from "@/types/auth";

const page = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const response = await api.get<ApiResponse<IAuthData>>("/me", {
      headers: { Cookie: `access_token=${accessToken}` },
    });
    const user = response.data.user;
    return <div>Welcome, {user.name}</div>;
  } catch {
    return <div>Error loading dashboard</div>;
  }
};

export default page;
