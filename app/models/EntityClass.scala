package models

import play.api.db.slick.Config.driver.simple._

case class EntityClass(identifier: String, name: String)

/* Table mapping
 */
class EntityClassTable(tag: Tag) extends Table[EntityClass](tag, "EntityClass") {

  def identifier = column[String]("identifier", O.PrimaryKey)
  def name = column[String]("name", O.NotNull)

  def * = (identifier, name) <> (EntityClass.tupled, EntityClass.unapply _)
}
