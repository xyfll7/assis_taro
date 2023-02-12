

export function GitActions() {
  const git_token = "";
  return <div className="m10" style={{ cursor: "pointer" }} onClick={() => {
    fetch("https://api.github.com/repos/xyfll7/assis_taro/dispatches", {
      method: "POST",
      body: JSON.stringify({
        "event_type": "cloud",
      }),
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${git_token}`,
      }
    });
  }}>GitActions</div>;
}
