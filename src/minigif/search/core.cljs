(ns minigif.search.core
  (:require
    [minigif.component.imagesearch]
    [reagent.core :as reagent]
    [cljs.core.async])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(def fmt-map {"Enter" "auto"
              "c" "clipboard"
              "e" "embed"
              "h" "html"
              "m" "markdown"
              "r" "raw"})
(def target-tab (cljs.core/atom nil))

(defn- insert-image
  [img fmt]
  (when-let [tabid @target-tab]
    (js/chrome.tabs.sendMessage tabid
                                (clj->js {:action :insert_image
                                          :data {:format fmt
                                                 :img img}})
                                #(js/window.close))))

(defn SearchPage
  []
  [minigif.component.imagesearch/ImageSearch
   {:autoFocus true
    :onClick (fn [_ img]
               (insert-image img (fmt-map "Enter")))
    :onKeyPress (fn [evt img]
                  (when-let [fmt (fmt-map (.-key evt) nil)]
                    (insert-image img fmt)))}])

(js/chrome.runtime.onMessage.addListener
  (fn [msg sender sendResponse]
    (when (= "configure_select_image_window" (.-action msg))
      (reset! target-tab (-> msg .-data .-tabId))
      (sendResponse))))

(js/window.addEventListener
  "load"
  (fn [_]
    (reagent/render-component [SearchPage] (.-body js/document))))