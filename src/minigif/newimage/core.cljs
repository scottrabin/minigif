(ns minigif.newimage.core
  (:require
    [chromate.windows]
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
            (chromate.windows/remove (<! (chromate.windows/get-current)))
            (js/alert res)))))))

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
    (let [img (atom {})]
      (js/chrome.runtime.onMessage.addListener
        (fn [msg sender sendResponse]
          (when (= "configure_new_image_window" (.-action msg))
            (swap! img merge
                   (js->clj (-> msg .-data .-img) :keywordize-keys true)
                   {:tags #{}})
            (js/console.debug "got msg" msg @img)
            (sendResponse))))
      (reagent/render-component [AddImagePage img] (.-body js/document)))))
