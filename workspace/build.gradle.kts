// 设置自定义构建目录，避免在云同步文件夹中生成build目录
buildDir = file(System.getProperty("user.home") + "/.gradle-build/${rootProject.name}")

plugins {
    kotlin("multiplatform") version "1.9.22"
    kotlin("plugin.serialization") version "1.9.22"
    application
}

repositories {
    mavenCentral()
    google()
}

group = "ai.brainstorm"
version = "0.1.0"

kotlin {
    jvm {
        jvmToolchain(23)
        withJava()
    }
    js {
        browser {
            binaries.executable()
        }
        useCommonJs()
        nodejs()
    }
    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
                implementation("io.ktor:ktor-client-core:2.3.8")
                implementation("io.ktor:ktor-client-content-negotiation:2.3.8")
                implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.8")
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")
            }
        }
        val jvmMain by getting {
            dependencies {
                implementation("io.ktor:ktor-client-core:2.3.8")
                implementation("io.ktor:ktor-client-cio:2.3.8")
                implementation("io.ktor:ktor-client-content-negotiation:2.3.8")
            }
        }
        val jsMain by getting {
            dependencies {
                implementation("io.ktor:ktor-client-core-js:2.3.8")
                implementation("io.ktor:ktor-client-js:2.3.8")
                implementation("io.ktor:ktor-client-content-negotiation-js:2.3.8")
                implementation("org.jetbrains.kotlin-wrappers:kotlin-react:18.2.0-pre.687")
                implementation("org.jetbrains.kotlin-wrappers:kotlin-react-dom:18.2.0-pre.687")
                implementation("org.jetbrains.kotlin-wrappers:kotlin-emotion:11.11.1-pre.687")
                implementation(npm("react", "18.2.0"))
                implementation(npm("react-dom", "18.2.0"))
            }
        }
    }
}

tasks.withType<JavaCompile> {
    sourceCompatibility = JavaVersion.VERSION_17.toString()
    targetCompatibility = JavaVersion.VERSION_17.toString()
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions {
        jvmTarget = "17"
    }
}

tasks.named<JavaExec>("run") {
    standardInput = System.`in`
}

application {
    mainClass.set("ai.brainstorm.shell.ShellAppKt")
}
