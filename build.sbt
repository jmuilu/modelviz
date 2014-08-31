name := """modelviz"""

version := "1.0-SNAPSHOT"

scalaVersion := "2.11.1"

libraryDependencies ++= Seq(
  "org.webjars" %% "webjars-play" % "2.3.0",
  "com.typesafe.play" %% "play-slick" % "0.8.0-M1",
  "mysql" % "mysql-connector-java" % "5.1.31",
  "org.webjars" % "webjars-play_2.11" % "2.3.0",
  "org.webjars" % "requirejs" % "2.1.14-1",
  "org.webjars" % "underscorejs" % "1.6.0-3",
  "org.webjars" % "jquery" % "2.1.1",
  "org.webjars" % "bootstrap" % "3.2.0" exclude("org.webjars", "jquery"),
  "org.webjars" % "angularjs" % "1.2.19" exclude("org.webjars", "jquery")
)

resolvers += "Local Maven Repository" at "file:///"+Path.userHome+"/.m2/repository"

fork in Test := false

lazy val root = (project in file(".")).enablePlugins(PlayScala)

