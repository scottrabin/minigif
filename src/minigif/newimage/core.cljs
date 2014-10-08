(ns minigif.newimage.core
  (:require
    [cemerick.url :as url]
    [minigif.common.images]
    [reagent.core :as reagent :refer [atom]]
    [cljs.core.async])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(defn- add-tag-to-image
  [img evt]
  (.preventDefault evt)
  (let [taginput (.namedItem (-> evt .-target .-elements) "tag")
        newtag (.-value taginput)]
    (if-not (= newtag "")
      (do
        (set! (.-value taginput) "")
        (swap! img update-in [:tags] conj newtag))
      (go
        (let [res (<! (minigif.common.images.save-image! @img))]
          (if (= res @img)
            (js/window.close)))))))

(defn AddImagePage
  [img]
  (fn []
    [:div
     [:form {:onSubmit (partial add-tag-to-image img)}
      [:img {:src (:src @img)}]
      [:input {:name        "tag"
               :autoFocus   true
               :placeholder "Tags"}]
      [:button {:type :submit} "Add to Collection"]]
     [:ul {:className "tags"}
      (for [tag (:tags @img)]
        [:li {:className "tag"} tag])]]))

(js/window.addEventListener
  "load"
  (fn [_]
    (let [query (-> js/window.location url/url :query)
          imgsrc (get query "img")
          imgtags (get query "tags")
          img (atom {:src imgsrc :tags (apply set imgtags)})]
      (reagent/render-component [AddImagePage img] (.-body js/document)))))
