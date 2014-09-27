(ns minigif.component.imagesearch
  (:require
    [minigif.common.images]
    [reagent.core :as reagent :refer [atom]]
    [cljs.core.async])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(defn- ImageSearchResult
  "Individual result image for ImageSearchComponent; delegates some events
  to provide additional data when selected"
  [{:keys [img tabIndex onKeyPress onClick]}]
  [:div {:className "imagesearch--imgframe"}
   [:img {:src        (:src img)
          :tabIndex   tabIndex
          :onKeyPress (when onKeyPress
                        (fn [evt] (onKeyPress evt img)))
          :onClick    (when onClick
                        (fn [evt] (onClick evt img)))}]])

(defn- update-image-search
  "Internal method for updating ImageSearch component with matching images"
  [imgs e]
  (.preventDefault e)
  (let [form (if (nil? (-> e .-target .-form))
               (-> e .-target)
               (-> e .-target .-form))
        input (.namedItem (.-elements form) "search-term")
        search-term (.-value input)]
    (if (= 0 (count search-term))
      (reset! imgs [])
      (go
        (reset! imgs (<! (minigif.common.images/get-images search-term)))))))

(defn ImageSearch
  "Image search component that allows input for tags to match against images"
  [{:keys [search-term onKeyPress onClick autoFocus] :or {:autoFocus false}}]
  (let [images (atom [])
        do-search (partial update-image-search images)]
    (fn []
      [:form {:className "imagesearch"
              :onSubmit  do-search}
       [:input {:placeholder "Filter images by tag..."
                :name        "search-term"
                :tabIndex    1
                :autoFocus   autoFocus
                :onChange    do-search}]
       [:div {:className "imagesearch--container"}
        (map #(vector ImageSearchResult {:img        %1
                                         :key        (:src %1)
                                         :tabIndex   %2
                                         :onKeyPress onKeyPress
                                         :onClick    onClick})
             @images
             (iterate inc 2))]])))
