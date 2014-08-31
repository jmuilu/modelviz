package controllers

import models._
import play.api._
import play.api.db.slick._
import play.api.db.slick.Config.driver.simple._
import play.api.data._
import play.api.data.Forms._
import play.api.mvc._
import play.api.Play.current
import play.api.mvc.BodyParsers._
import play.api.libs.json.Json
import play.api.libs.json.Json._
import scala.slick.lifted.TableQuery

object Application extends Controller{

  //create an instance of the table
  val entities = TableQuery[EntityClassTable] //see a way to architect your app in the computers-database-slick sample  

  //JSON read/write macro
  implicit val entityFormat = Json.format[EntityClass]

  def index = DBAction { implicit rs =>
    Ok(views.html.index(entities.list)) 
  }  

  val entityForm = Form(
    mapping(
      "name" -> text(),
      "color" -> text()
    )(EntityClass.apply)(EntityClass.unapply)
  )

  def insert = DBAction { implicit rs =>
    val entity = entityForm.bindFromRequest.get
    entities.insert(entity)

    Redirect(routes.Application.index)
  }

  def jsonFindAll = DBAction { implicit rs =>
    Ok(toJson(entities.list))
  }

  def jsonInsert = DBAction(parse.json) { implicit rs =>
    rs.request.body.validate[EntityClass].map { entity =>
        entities.insert(entity)
        Ok(toJson(entity))
    }.getOrElse(BadRequest("invalid json"))    
  }
  
}
