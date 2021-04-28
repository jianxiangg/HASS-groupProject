### Religious population by planning area
pop <- read.csv("resident-population-religion.csv", stringsAsFactors = TRUE)
pop <- pop[,c(2,4,5)]
pop$value <- pop$value * 1000
pop_wide <- reshape(pop, idvar="level_3", timevar="level_1", v.names="value", direction="wide")
colnlist <- unique(pop$level_1)
colnlist <- c("Subzone", as.character(colnlist))
colnames(pop_wide) <- colnlist
pop_wide <- pop_wide[-nrow(pop_wide),]

pop_wide$Christianity <- pop_wide$`Christianity- Catholic` + pop_wide$`Christianity- Other Christians`
pop_wide$BuddhismTaoism <- pop_wide$Buddhism + pop_wide$Taoism
str(pop_wide)
top3_wide <- subset(pop_wide, select=c("Subzone", "Total", "BuddhismTaoism", "Islam", "Christianity"))

write.csv(top3_wide, "Total_Top3_Religion-Population.csv")


### Religious population proportion
data_broad <- read.csv("residents-by-religion-broad-ethnic-group-and-sex.csv", stringsAsFactors =  FALSE)
data <- read.csv("residents-by-religion-ethnic-group-and-sex.csv", stringsAsFactors = FALSE)

data_broad <- subset(data_broad, data_broad$level_1 != "Total" & data_broad$level_2 == "Total")
data <- subset(data, data$level_1 != "Total" & data$level_2 == "Total")

no_rel <- subset(data_broad, data_broad$level_3 == "No Religion")
no_rel$level_4 <- "No Religion"
no_rel <- no_rel[, c("year", "level_1", "level_2", "level_3", "level_4", "value")]
data <- rbind(data, no_rel)
data <- data[, c("level_1","level_4","value")]
colnames(data) <- c("Ethnic_Group", "Religion", "value")
data <- data[order(data$Ethnic_Group),]
data$value <- data$value * 1000
data_wide <- reshape(data, idvar="Ethnic_Group", timevar="Religion", v.names="value", direction="wide")
colnlist <- unique(data$Religion)
colnlist <- c("Ethnic_Group", as.character(colnlist))
colnames(data_wide) <- colnlist
data_wide[is.na(data_wide)] <- 0
write.csv(data_wide, "Religious Pop by Ethnic Group.csv")
