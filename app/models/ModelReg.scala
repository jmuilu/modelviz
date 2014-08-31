package models

import play.api.db.slick.Config.driver.simple._
import play.api.libs.json._
import play.api.libs.functional.syntax
import play.api.db.slick.Config.driver.simple._
import scala.slick.jdbc.{ GetResult, StaticQuery => Q }
import Q.interpolation
import play.Logger

case class Attrib(Identifier: String, name: String)

object ModelReg {

  def getAttribute(Identifier: String)(implicit session: Session): Option[JsObject] = {

    val attributes = Q[String, (String, String)] + """
			  select Identifier, name from AttributeClass where Identifier = ?
			  """
    val json = for (a <- attributes(Identifier).list) yield {
      Json.obj("Identifier" -> a._1, "name" -> a._2)
    }
    if (json.size > 0) {
      Some(json.head)
    } else {
      None
    }
  }

  /*
   *  entity
   *    attribute = { name, type: entity, atype, ...}
   *    
   * See views in conf/views.sql    
   *    
   */

  def getEntity(identifier: String, neighbours: Int = 1)(implicit session: Session): Option[JsObject] = {

    val entity = Q[String, (String, String, String, String, String, String, String, String)] + """
			  select e.Identifier, e.Name, e.type, e.description,p.Identifier, p.Name, p.description, e.typeQualifier from EntityClassV e join PackageClassV p  on p.id = e.packageClass where e.Identifier = ?
			  """
    val attributes = Q[String, (String, String, String, String, String, String, Boolean, String, String, String, String, String, String, String)] + """
			select a.Identifier, a.Name, a.type, t.Name as typeName, t.Identifier as typeIdentifier, 
			       t.type as typeType, a.navigable , a.aggregation, a.description, ea.Identifier,a.lowerBound,a.upperBound, ea.Name, a.typeQualifier 
			   from AttributeClassV a 
			   join EntityClassV e  on e.id = a.entity 
			   join EntityClassV t  on a.classifier = t.id  
			left outer join EntityClassV ea on a.associationEntity = ea.id
			   where e.Identifier = ?
    """

    // this is for owl "declared-properties"... hack.. put in one sql
    val attributes2 = Q[String, (String, String, String, String, String, String, Boolean, String, String, String, String, String, String, String)] + """
			select a.Identifier, a.Name, a.type, "" as typeName, "" as typeIdentifier, 
			       "" as typeType, a.navigable , a.aggregation, a.description, ea.Identifier,a.lowerBound,a.upperBound, ea.Name, a.typeQualifier
			   from AttributeClassV a 
			   join EntityClassV e  on e.id = a.entity
			   join EntityClassV ea on a.associationEntity = ea.id
			   where a.type = 'associationDefinition' and e.Identifier = ?
    """

    val parentEntities = Q[String, (String)] + """
			select p.Identifier from EntityClassV e, EntityClass_parentEntity se, EntityClassV p 
             where e.id = se.EntityClass and se.parentEntity = p.id and e.Identifier = ?
    """

    val childEntities = Q[String, (String)] + """
			select e.Identifier from EntityClassV e, EntityClass_parentEntity se, EntityClassV p 
             where e.id = se.EntityClass and se.parentEntity = p.id and p.Identifier = ?
    """

    val rootEntity = entity(identifier).list

    if (rootEntity.size == 0) {

      Logger.warn("Element " + identifier + " not found")
      return None
  
    } else {

      val attribs = attributes(identifier).list ++ attributes2(identifier).list

      val jattribs = for (a <- attribs) yield {
        //todo: change names of typeXXX things  to targetXXX
        Json.obj("Identifier" -> a._1, "name" -> a._2, "type" -> a._3, "typeQualifier" -> a._14, "dependencyQualifier" -> "FIXME", "typeName" -> a._4, "typeIdentifier" -> a._5, "typeType" -> a._6,
          "navigable" -> a._7, "aggregation" -> a._8, "description" -> a._9, "associationIdentifier" -> a._10,
          "lowerBound" -> a._11, "upperBound" -> a._12, "associationName" -> a._13)
      }

      val parents = parentEntities( identifier).list
      val children = childEntities( identifier).list

      val relatedEntities = if (neighbours > 0) {
        for (id <- (attribs.filter(a => a._3 != "associationDefinition").map(a => a._5) ++ parents ++ children).distinct) yield {
          getEntity(id, neighbours - 1)
        }
      } else {
        List()
      }

      //todo remove redundant copies... scala group by over Identifier and select
      val cleaned = relatedEntities.flatten
      val E = rootEntity.head
      return Some(Json.obj("identifier" -> E._1, "name" -> E._2, "type" -> E._3, "typeQualifier" -> E._8, "attributes" -> jattribs, "neighbourLevel" -> neighbours,
        "relatedEntities" -> cleaned, "parentIDs" -> parents, "description" -> E._4, "packageIdentifier" -> E._5, "packageName" -> E._6, "packageDescription" -> E._7))

    }

  }
}