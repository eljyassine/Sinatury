package tn.docsign.templateMS.entity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.Set;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Element   {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long idElement;
    @OneToOne(cascade = {CascadeType.ALL})
    @JoinColumn(name = "attrs_ID")
    public Attrs attrs;
    public String className;
    @OneToMany(
            cascade = CascadeType.ALL)
    public Set<Child> children;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="idPlaceholder")
    private Placeholder placeholder;


}




