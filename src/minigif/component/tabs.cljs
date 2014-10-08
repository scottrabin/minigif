(ns minigif.component.tabs
  (:require
    [clojure.string]
    [reagent.core :as reagent :refer [atom]]))

(defn- tab-header
  [tab-name active]
  [:li {:class (when (= tab-name @active) "active")
        :onClick #(reset! active tab-name)} tab-name])

(defn- tab-panel
  [tab-name tab-contents active]
  [:div {:class (str
                  (when (= tab-name @active) "active ")
                  "tabs--panel")}
   tab-contents])

(defn Tabs
  []
  (let [active (atom "")]
    (fn [attrs & tabs]
      (reset! active (:active attrs))
      [:div (assoc attrs
                   :class "tabs")
       [:ul {:className "tabs--header"}
        (for [tab-name (map #(-> % meta :tab) tabs)]
          [tab-header tab-name active])]
       [:div {:className "tabs--body"}
        (for [tab tabs]
          [tab-panel (-> tab meta :tab) tab active])]])))
