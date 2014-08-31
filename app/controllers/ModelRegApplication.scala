package controllers

import play.api.mvc._
import play.api.db.slick.DBAction
import models.ModelReg

object ModelRegApplication extends Controller {

  def index = DBAction { implicit rs =>
    Ok(views.html.modelreg("HELLO"))
  }

  def attribute = DBAction {
    implicit rs =>

      val id = rs.getQueryString("identifier")
      if (id.isDefined) {
        val attribute = ModelReg.getAttribute(id.get)(rs.dbSession)
        if (attribute.isDefined) {
          Ok(attribute.get)
        } else {
          BadRequest("Error in attributes-call. Attribute " + id.get + " not found")
        }
      } else {
        BadRequest("Error in attributes-call. Identifier is missing")
      }
  }

    def entity = DBAction {
    implicit rs =>

      val id = rs.getQueryString("identifier")
      val neigbneighbours = Integer.parseInt(rs.getQueryString("neighbours").getOrElse("1"))
      
      if (id.isDefined ) {
        val e = ModelReg.getEntity(id.get,neigbneighbours)(rs.dbSession)
        if (e.isDefined) {
          Ok(e.get)
        } else {
          BadRequest("Error in elements-call. Entity " + id.get + " not found")
        }
      } else {
        BadRequest("Error in attributes-call. Identifier is missing")
      }
  }

  
}