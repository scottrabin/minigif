(ns minigif.common.images
  (:require
    [minigif.common.db :as db]
    [cljs.core.async]))

;(defrecord Image [src tags])

(defn- img->store
  "Converts an image record into an IndexedDB-safe value"
  [img]
  (clj->js img))

(defn- store->img
  "Converts a value from IndexedDB into an image record"
  [idbimg]
  {:src (.-src idbimg)
   :tags (set (.-tags idbimg))})

(defn- char->int
  "Convert a single character into an integer. `int` does not work in cljs"
  [c]
  (.charCodeAt c 0))

(defn- tag-key-range
  "Convert a tag partial match into a valid IDBKeyRange value"
  [tag]
  (.bound js/IDBKeyRange
          tag
          (str
            (apply str (drop-last tag))
            (-> tag last char->int (+ 1) char))
          false
          true))

(defn save-image!
  "Save an image into the database"
  [img]
  (let [result (cljs.core.async/chan)]
    (db/transact! db/READWRITE ["images"]
                  (fn [transaction]
                    (let [imagestore (.objectStore transaction "images")]
                      (.put imagestore (img->store img))
                      (set! (.-oncomplete transaction)
                            #(cljs.core.async/put! result
                                                   (if-let [err (.-error transaction)]
                                                    err
                                                    img)))
                      (set! (.-onerror transaction)
                            #(cljs.core.async/put! result (.-error transaction))))))
    result))

(defn get-images
  "Get images from the database matching the given tag partial"
  [tag]
  (let [result (cljs.core.async/chan)]
    (db/transact! db/READ ["images"]
                  (fn [transaction]
                    (let [imagestore (.objectStore transaction "images")
                          tagindex (.index imagestore "tags")
                          cursor (.openCursor tagindex (tag-key-range tag))
                          agg (atom [])]
                      (set! (.-onsuccess cursor)
                            (fn [event]
                              (if-let [cursor (-> event .-target .-result)]
                                (do
                                  (swap! agg conj (-> cursor .-value store->img))
                                  (.continue cursor))
                                (do
                                  (cljs.core.async/put! result @agg)
                                  (cljs.core.async/close! result))))))))
    result))

(defn get-tags
  "Get all of the tags used on any image in the database"
  []
  (let [result (cljs.core.async/chan)]
    (db/transact! db/READ ["images"]
                  (fn [transaction]
                    (let [imagestore (.objectStore transaction "images")
                          tagindex (.index imagestore "tags")
                          cursor (.openKeyCursor tagindex)
                          agg (atom #{})]
                      (set! (.-onsuccess cursor)
                            (fn [event]
                              (if-let [cursor (-> event .-target .-result)]
                                (do
                                  (swap! agg conj (-> cursor .-key))
                                  (.continue cursor))
                                (do
                                  (cljs.core.async/put! result @agg)
                                  (cljs.core.async/close! result))))))))
    result))
