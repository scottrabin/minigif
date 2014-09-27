(defproject minigif "0.1.0-SNAPSHOT"
  :description "FIXME: write this!"
  :url "http://example.com/FIXME"

  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/clojurescript "0.0-2342"]
                 [reagent "0.4.2"]
                 [org.clojure/core.async "0.1.346.0-17112a-alpha"]]

  :plugins [[lein-cljsbuild "1.0.4-SNAPSHOT"]]

  :source-paths ["src"]

  :cljsbuild {
    :builds {:background
             {:source-paths ["src/minigif/background" "src/minigif/common" "src/chromate"]
              :compiler {:output-to "minigif-background.js"
                         :output-dir "out/minigif-background"
                         :optimizations :none
                         :source-map true}}
             :manage
             {:source-paths ["src/minigif/manage" "src/minigif/common" "src/minigif/component" "src/chromate"]
              :compiler {:output-to "minigif-manage.js"
                         :output-dir "out/minigif-manage"
                         :optimizations :none
                         :source-map true }}
             :search
             {:source-paths ["src/minigif/search" "src/minigif/common" "src/minigif/component" "src/chromate"]
              :compiler {:output-to "minigif-search.js"
                         :output-dir "out/minigif-search"
                         :optimizations :none
                         :source-map true}}
             :newimage
             {:source-paths ["src/minigif/newimage" "src/minigif/common" "src/minigif/component" "src/chromate"]
              :compiler {:output-to "minigif-newimage.js"
                         :output-dir "out/minigif-newimage"
                         :optimizations :none
                         :source-map true}}}})