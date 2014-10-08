(ns minigif.manage.core
  (:require
    [minigif.common.images]
    [minigif.component.tabs]
    [minigif.component.imagesearch]
    [reagent.core :as reagent :refer [atom]]
    [cljs.core.async])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(defn TagList
  [{:keys [tags onClick]}]
  [:ul {:class "tag-list"}
   (for [tag tags]
     [:li {:onClick #(onClick tag)} tag])])

(defn ManagePage
  [tags]
  (let [state (atom {:active-tab "Images"
                     :search-term ""})]
    (fn []
      [minigif.component.tabs/Tabs
       {:id "manage-tabs"
        :active (:active-tab @state)}
       ^{:tab "Images"}
       [minigif.component.imagesearch/ImageSearch
        {:search-term (:search-term @state)}]

       ^{:tab "Tags"}
       [TagList
        {:tags tags
         :onClick #(swap! state assoc :active-tab "Images" :search-term %)}]

       ^{:tab "Settings"}
       [:div nil "settings"]])))

(js/window.addEventListener
  "load"
  (fn [_]
    (go
      (let [tags (<! (minigif.common.images/get-tags))]
        (reagent/render-component [ManagePage tags] (.-body js/document))))))
