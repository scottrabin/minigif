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
  [imgs search-term]
  (if (= "" search-term)
      (reset! imgs [])
      (go
        (reset! imgs (<! (minigif.common.images/get-images search-term))))))

(defn ImageSearch
  "Image search component that allows input for tags to match against images"
  []
  (let [images (atom [])
        search (atom {:prop "" :current ""})
        do-search (partial update-image-search images)]
    (fn [{:keys [search-term onKeyPress onClick autoFocus] :or {:autoFocus false :search-term ""}}]
      (let [term (str search-term)]
      (when-not (= (:prop @search) term)
        (swap! search assoc :current term :prop term)
        (do-search (:current @search))))
      [:form {:className "imagesearch"
              :onSubmit  #(do
                            (.preventDefault %)
                            (do-search (:current @search)))}
       [:input {:placeholder "Filter images by tag..."
                :name        "search-term"
                :value       (:current @search)
                :tabIndex    1
                :autoFocus   autoFocus
                :on-change    #(let [v (-> % .-target .-value)]
                                 (swap! search assoc :current v)
                                 (do-search v))}]
       [:div {:className "imagesearch--container"}
        (map #(vector ImageSearchResult {:img        %1
                                         :key        (:src %1)
                                         :tabIndex   %2
                                         :onKeyPress onKeyPress
                                         :onClick    onClick})
             @images
             (iterate inc 2))]])))
