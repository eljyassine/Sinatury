package tn.docsign.documentMS.dto;


import lombok.Data;

@Data
public class MailDTO {

    private String idMail;
    private String subjectMail;
    private String  messageMail;
    private Boolean reminderEnabled;
    private int reminderDelay;
    private int reminderFrequency;
    private Boolean exprationEnabled;
    private int exprationDelay;
}
