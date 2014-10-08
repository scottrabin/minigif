(ns minigif.search.core
  (:require
    [cemerick.url :as url]
    [chromate.tabs]
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

(defn- insert-image
  [tabid img fmt]
  (go
    (<! (chromate.tabs/send-message tabid {:action :insert_image
                                           :data {:format fmt
                                                  :img img}}))
    (js/window.close)))

(defn SearchPage
  [tabid]
  [minigif.component.imagesearch/ImageSearch
   {:autoFocus true
    :onClick (fn [_ img]
               (insert-image tabid img (fmt-map "Enter")))
    :onKeyPress (fn [evt img]
                  (when-let [fmt (fmt-map (.-key evt) nil)]
                    (insert-image tabid img fmt)))}])

(js/window.addEventListener
  "load"
  (fn [_]
    (let [tabid (-> (url/url js/window.location)
                    :query
                    (get "tab")
                    int)]
      (reagent/render-component [SearchPage tabid] (.-body js/document)))))
