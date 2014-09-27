(ns chromate.windows
  (:refer-clojure :exclude [remove])
  (:require [cljs.core.async])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(defn- win->clj
  [win]
  (js->clj win :keywordize-keys true))

(defn get-current
  "Get the current window object"
  ([] (get-current nil))
  ([get-info]
   (let [c (cljs.core.async/chan)]
     (js/chrome.windows.getCurrent
       (clj->js (if (nil? get-info)
                  get-info
                  (select-keys [:populate] get-info)))
       (fn [win]
         (cljs.core.async/put! c (win->clj win))
         (cljs.core.async/close! c)))
     c)))

(defn remove
  "Remove the given window object"
  [win]
  (let [c (cljs.core.async/chan)]
    (js/chrome.windows.remove
      (:id win)
      #(cljs.core.async/close! c))
    c))
