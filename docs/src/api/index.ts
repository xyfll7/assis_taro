




async function get_token() {
  // 如果 X-Token 超时 获取新的 X-Token 并保存
  if (!Number(localStorage.getItem("X-Expires")) || Date.now() > Number(localStorage.getItem("X-Expires"))) {
    const res = await fetch(`https://dev.xxassis.cc/a__adocs_cloud/get_token`, { method: "POST" });
    localStorage.setItem("X-Token", res.headers.get("X-Token")!);
    const expires = (Number(res.headers.get("X-Expires")!) - 200) * 1000 + Date.now();
    localStorage.setItem("X-Expires", String(expires));
  }
  return localStorage.getItem("X-Token")!;
}

async function Fetch(url: string, init?: RequestInit | undefined) {

  const BaseUrl = "https://dev.xxassis.cc";
  const res = await fetch(url.includes("https") ? url : `${BaseUrl}${url}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Token": await get_token()
    },
  });
  return res;
}


export function login() {
  return Fetch("/a__adocs_cloud/login");
}

