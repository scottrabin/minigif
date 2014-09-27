(ns minigif.manage.core
  (:require
    [minigif.component.imagesearch]
    [reagent.core :as reagent :refer [atom]]
    [cljs.core.async])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(defn ManagePage
  []
  [minigif.component.imagesearch/ImageSearch])

(.addEventListener js/window "load"
                   #(reagent/render-component [ManagePage] (.-body js/document)))
