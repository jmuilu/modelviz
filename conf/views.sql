create or replace view AttributeClassV as
select  a.id,c.Identifier, c.Name, c.description, 
        a.qName, a.sourceContext, a.aggregation, a.defaultValue, a.inherited, 
        a.isID ,a.lowerBound, a.upperBound,a.uniqueValue, a.maxVal, a.minVal, 
        a.navigable, a.ordered, a.sourceIdentifier,a.entity,
        a.associationEntity,a.attributeSet,a.classifier,
        c1.Identifier as type, c2.Identifier as typeQualifier
 from AttributeClass a
 join Characteristic c             on a.id = c.id 
 join OntologyTerm t1              on a.type = t1.id
 join Characteristic c1            on t1.id = c1.id
 left outer join OntologyTerm t2   on a.typeQualifier = t2.id
 left outer join Characteristic c2 on t2.id = c2.id ;
 
 
create or replace view EntityClassV as
select  a.id,c.Identifier, c.Name, c.description, 
        a.qName,a.sourceIdentifier,a.sourceContext, a.packageClass,
        c1.Identifier as type, c2.Identifier as typeQualifier
 from EntityClass a
 join Characteristic c             on a.id = c.id 
 join OntologyTerm t1              on a.type = t1.id
 join Characteristic c1            on t1.id = c1.id
 left outer join OntologyTerm t2   on a.typeQualifier = t2.id
 left outer join Characteristic c2 on t2.id = c2.id ;
 
 
create or replace view PackageClassV as
select  a.id,c.Identifier, c.Name, c.description, 
        a.qName,a.sourceIdentifier,a.sourceContext,a.parentPackage,
        c1.Identifier as type, c2.Identifier as typeQualifier
 from PackageClass a
 join Characteristic c             on a.id = c.id 
 join OntologyTerm t1              on a.type = t1.id
 join Characteristic c1            on t1.id = c1.id
 left outer join OntologyTerm t2   on a.typeQualifier = t2.id
 left outer join Characteristic c2 on t2.id = c2.id ;

