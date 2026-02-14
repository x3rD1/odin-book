import { useState, useEffect } from "react";
import styles from "./GifPicker.module.css";
import CloseIcon from "../assets/icons/x.svg?react";
import { useLockBodyScroll } from "../utils/useLockBodyScroll";

export default function GifPicker({ onSelect, onClose }) {
  const [gifs, setGifs] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useLockBodyScroll(true);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query.trim()) {
        setGifs([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/gifs/search?q=${query}`,
          { credentials: "include" },
        );

        const data = await res.json();
        setGifs(data.data || []);
      } catch (err) {
        console.error("Failed to fetch GIFs:", err);
        setGifs([]);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (url) => {
    onSelect(url);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Choose a GIF</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search GIFs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : gifs.length === 0 ? (
            <div className={styles.empty}>
              {query.trim() ? "No GIFs found" : "Type to search GIFs"}
            </div>
          ) : (
            <div className={styles.gifGrid}>
              {gifs.map((gif) => (
                <div
                  key={gif.id}
                  className={styles.gifItem}
                  onClick={() => handleSelect(gif.images.original.url)}
                >
                  <img
                    src={gif.images.fixed_width_small.url}
                    alt={gif.title}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
