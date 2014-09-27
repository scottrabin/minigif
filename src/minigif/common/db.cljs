(ns minigif.common.db
  (:require
    [cljs.core.async :refer [<!]])
  (:require-macros
    [cljs.core.async.macros :refer [go]]))

(def DB_NAME "MiniGIF")
(def DB_VERSION 3)

(def READ "readonly")
(def READWRITE "readwrite")

(def ^:private -db (atom))

(defn- get-db
  "Gets the database after applying any necessary updates to it"
  []
  (let [rc (cljs.core.async/chan)]
    (if-let [d @-db]
      (cljs.core.async/put! rc d)
      (let [request (.open js/indexedDB DB_NAME DB_VERSION)]
        (set! (.-onupgradeneeded request)
              (fn [event]
                (let [db (-> event .-target .-result)
                      transaction (-> event .-target .-transaction)
                      imagestore (if (.contains (.-objectStoreNames db) "images")
                                   (.objectStore transaction "images")
                                   (.createObjectStore db "images" #js {:keyPath "src"}))
                      tagindex (if (.contains (.-indexNames imagestore) "tags")
                                 (.index imagestore "tags")
                                 (.createIndex imagestore "tags" #js {:unique false
                                                                      :multiEntry true}))])))
        (set! (.-onsuccess request)
              (fn [event]
                (let [db (-> event .-target .-result)]
                  (reset! -db db)
                  (cljs.core.async/put! rc db))))
        (set! (.-onerror request)
              (fn [event]
                (.error js/console "Could not get database: " event)))))
    rc))

(defn transact!
  "Executes the requested operations against a database transactions"
  [mode stores f]
  (go
    (let [db (<! (get-db))]
      (f (.transaction db (clj->js stores) mode)))))
