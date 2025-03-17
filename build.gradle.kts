buildDir = file(System.getProperty("user.home") + "/.gradle-build/${rootProject.name}")

plugins {
    kotlin("multiplatform") version "2.1.10"
    application
}

kotlin {
    jvm {
        withJava()
    }
    js {
        browser() // Adding browser target as specified in design.md
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.2")
            }
        }
        val jvmMain by getting {
            dependencies {
                // JVM-specific dependencies here
            }
        }
    }
}

application {
    mainClass.set("ai.brainstorm.MainKt")
}

repositories {
    mavenCentral()
}
