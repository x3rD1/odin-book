export function Media({ url, type }) {
  if (!url) return null;

  const optimizedUrl = url.replace(
    "/upload/",
    "/upload/w_800,c_limit,q_auto,f_auto/",
  );

  if (type === "image") {
    return <img src={optimizedUrl} loading="lazy" />;
  }

  if (type === "video") {
    return <video src={url.replace("/upload/", "/upload/q_auto/")} controls />;
  }

  return null;
}
